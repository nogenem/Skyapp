package com.nogenem.skyapp.service;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.PostConstruct;

import com.nogenem.skyapp.constants.SocketEvents;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.socket.engineio.server.EngineIoServer;
import io.socket.socketio.server.SocketIoNamespace;
import io.socket.socketio.server.SocketIoServer;
import io.socket.socketio.server.SocketIoSocket;
import lombok.Getter;

@Service
public class SocketIoService {
  @Value("${env.IO_NAMESPACE}")
  @Getter
  private String namespace;

  @Getter
  private EngineIoServer engineIoServer;
  private SocketIoServer socketIoServer;
  private SocketIoNamespace socketIoNamespace;

  private HashMap<String, String> currentUsersChannelsIds = new HashMap<>();

  @PostConstruct
  public void init() {
    this.engineIoServer = new EngineIoServer();
    this.socketIoServer = new SocketIoServer(this.engineIoServer);
    this.socketIoNamespace = socketIoServer.namespace(this.namespace);

    this.initEventHandlers();
  }

  private void initEventHandlers() {
    this.socketIoNamespace.on(SocketEvents.SOCKET_CONNECT, (Object... args) -> {
      SocketIoSocket socket = (SocketIoSocket) args[0];
      Map<String, String> query = socket.getInitialQuery();
      String currentUserId = query.get("_id");

      if (currentUserId != null && !currentUserId.isEmpty()) {
        this.currentUsersChannelsIds.put(currentUserId, "");
        socket.joinRoom(currentUserId);
      }

      socket.on(SocketEvents.SOCKET_DISCONNECT, (Object... args2) -> {
        //
      });
    });
  }
}
