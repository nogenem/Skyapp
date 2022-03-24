package com.nogenem.skyapp.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.nogenem.skyapp.service.SocketIoService;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.server.HandshakeInterceptor;

import io.socket.engineio.server.EngineIoWebSocket;
import io.socket.parseqs.ParseQS;
import lombok.AllArgsConstructor;

@Controller
@AllArgsConstructor
public class SocketIoController implements HandshakeInterceptor, WebSocketHandler {
  private static final String ATTRIBUTE_ENGINEIO_BRIDGE = "socketIo.bridge";
  private static final String ATTRIBUTE_ENGINEIO_QUERY = "socketIo.query";

  private final SocketIoService socketIoService;

  @RequestMapping(value = "/socket.io/*", method = { RequestMethod.GET, RequestMethod.POST,
      RequestMethod.OPTIONS }, headers = "Connection!=Upgrade")
  public void socketIo(HttpServletRequest request, HttpServletResponse response) throws IOException {
    this.socketIoService.getEngineIoServer().handleRequest(request, response);
  }

  @Override
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    final EngineIoSpringWebSocket webSocket = new EngineIoSpringWebSocket(session);
    session.getAttributes().put(ATTRIBUTE_ENGINEIO_BRIDGE, webSocket);
    this.socketIoService.getEngineIoServer().handleWebSocket(webSocket);
  }

  @Override
  public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
    ((EngineIoSpringWebSocket) session.getAttributes().get(ATTRIBUTE_ENGINEIO_BRIDGE))
        .handleMessage(message);
  }

  @Override
  public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
    ((EngineIoSpringWebSocket) session.getAttributes().get(ATTRIBUTE_ENGINEIO_BRIDGE))
        .handleTransportError(exception);
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
    ((EngineIoSpringWebSocket) session.getAttributes().get(ATTRIBUTE_ENGINEIO_BRIDGE))
        .afterConnectionClosed(closeStatus);
  }

  @Override
  public boolean supportsPartialMessages() {
    return false;
  }

  @Override
  public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
      Map<String, Object> attributes) throws Exception {
    attributes.put(ATTRIBUTE_ENGINEIO_QUERY, request.getURI().getQuery());
    return true;
  }

  @Override
  public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
      Exception exception) {
  }

  private static final class EngineIoSpringWebSocket extends EngineIoWebSocket {

    private final WebSocketSession mSession;
    private final Map<String, String> mQuery;

    EngineIoSpringWebSocket(WebSocketSession session) {
      mSession = session;

      final String queryString = (String) mSession.getAttributes().get(ATTRIBUTE_ENGINEIO_QUERY);
      if (queryString != null) {
        mQuery = ParseQS.decode(queryString);
      } else {
        mQuery = new HashMap<>();
      }
    }

    /* EngineIoWebSocket */

    @Override
    public Map<String, String> getQuery() {
      return mQuery;
    }

    @Override
    public void write(String message) throws IOException {
      mSession.sendMessage(new TextMessage(message));
    }

    @Override
    public void write(byte[] message) throws IOException {
      mSession.sendMessage(new BinaryMessage(message));
    }

    @Override
    public void close() {
      try {
        mSession.close();
      } catch (IOException ignore) {
      }
    }

    /* WebSocketHandler */

    void afterConnectionClosed(CloseStatus closeStatus) {
      emit("close");
    }

    void handleMessage(WebSocketMessage<?> message) {
      if (message.getPayload() instanceof String || message.getPayload() instanceof byte[]) {
        emit("message", (Object) message.getPayload());
      } else {
        throw new RuntimeException(String.format(
            "Invalid message type received: %s. Expected String or byte[].",
            message.getPayload().getClass().getName()));
      }
    }

    void handleTransportError(Throwable exception) {
      emit("error", "write error", exception.getMessage());
    }

    @Override
    public Map<String, List<String>> getConnectionHeaders() {
      return null;
    }
  }
}
