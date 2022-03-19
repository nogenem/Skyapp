package com.nogenem.skyapp.service;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.PostConstruct;

import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.response.ChatInitialData;
import com.nogenem.skyapp.socketEmitters.GroupChannelCreatedEmitter;
import com.nogenem.skyapp.socketEmitters.GroupChannelUpdatedEmitter;
import com.nogenem.skyapp.socketEmitters.MessageEditedEmitter;
import com.nogenem.skyapp.socketEmitters.MessagesReceivedEmitter;
import com.nogenem.skyapp.socketEmitters.NewUserEmitter;
import com.nogenem.skyapp.socketEmitters.PrivateChannelCreatedEmitter;
import com.nogenem.skyapp.socketEmitters.RemovedFromGroupChannelEmitter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.socket.engineio.server.EngineIoServer;
import io.socket.engineio.server.EngineIoServerOptions;
import io.socket.socketio.server.SocketIoNamespace;
import io.socket.socketio.server.SocketIoServer;
import io.socket.socketio.server.SocketIoSocket;
import lombok.Getter;

// https://github.com/marcodiri/java_socketio_chatroom

@Service
public class SocketIoService {
  @Value("${env.IO_NAMESPACE}")
  @Getter
  private String namespace;

  @Getter
  private EngineIoServer engineIoServer;
  private SocketIoServer socketIoServer;
  private SocketIoNamespace socketIoNamespace;

  private final ChatService chatService;

  private HashMap<String, String> currentUsersChannelsIds;
  private HashMap<String, ISocketEmitter> emitters;

  public SocketIoService(ChatService chatService) {
    this.chatService = chatService;

    this.currentUsersChannelsIds = new HashMap<>();
    this.emitters = new HashMap<>();

    this.emitters.put(SocketEvents.IO_NEW_USER, new NewUserEmitter());
    this.emitters.put(SocketEvents.IO_PRIVATE_CHANNEL_CREATED, new PrivateChannelCreatedEmitter());
    this.emitters.put(SocketEvents.IO_GROUP_CHANNEL_CREATED, new GroupChannelCreatedEmitter());
    this.emitters.put(SocketEvents.IO_REMOVED_FROM_GROUP_CHANNEL, new RemovedFromGroupChannelEmitter());
    this.emitters.put(SocketEvents.IO_GROUP_CHANNEL_UPDATED, new GroupChannelUpdatedEmitter());
    this.emitters.put(SocketEvents.IO_MESSAGES_RECEIVED, new MessagesReceivedEmitter());
    this.emitters.put(SocketEvents.IO_MESSAGE_EDITED, new MessageEditedEmitter());
  }

  @PostConstruct
  public void init() {
    this.engineIoServer = new EngineIoServer(
        EngineIoServerOptions.newFromDefault()
            .setCorsHandlingDisabled(true));
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

      socket.on(SocketEvents.IO_GET_INITIAL_DATA, (Object... args2) -> {
        try {
          ChatInitialData initialData = chatService.getChatInitialData(currentUserId, this.currentUsersChannelsIds);

          SocketIoSocket.ReceivedByLocalAcknowledgementCallback func = (SocketIoSocket.ReceivedByLocalAcknowledgementCallback) args2[0];
          func.sendAcknowledgement(initialData.toJSON());
        } catch (Exception e) {
          e.printStackTrace();
        }
      });

      socket.on(SocketEvents.SOCKET_DISCONNECT, (Object... args2) -> {
        //
      });
    });
  }

  public void emit(String event, ISocketEventData data) {
    ISocketEmitter emitter = this.emitters.get(event);
    if (emitter != null) {
      emitter.emit(this.socketIoNamespace, this.currentUsersChannelsIds.keySet(), data);
    }
  }
}
