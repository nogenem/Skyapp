package com.nogenem.skyapp.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.PostConstruct;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.response.ChatInitialData;
import com.nogenem.skyapp.socketEmitters.GroupChannelCreatedEmitter;
import com.nogenem.skyapp.socketEmitters.GroupChannelUpdatedEmitter;
import com.nogenem.skyapp.socketEmitters.MessageDeletedEmitter;
import com.nogenem.skyapp.socketEmitters.MessageEditedEmitter;
import com.nogenem.skyapp.socketEmitters.MessagesReceivedEmitter;
import com.nogenem.skyapp.socketEmitters.NewUserEmitter;
import com.nogenem.skyapp.socketEmitters.PrivateChannelCreatedEmitter;
import com.nogenem.skyapp.socketEmitters.RemovedFromGroupChannelEmitter;
import com.nogenem.skyapp.socketEmitters.SetLastSeenEmitter;
import com.nogenem.skyapp.socketEmitters.UserSignedInEmitter;
import com.nogenem.skyapp.socketEmitters.UserSignedOutEmitter;
import com.nogenem.skyapp.socketEmitters.UserStatusChangedEmitter;
import com.nogenem.skyapp.socketEmitters.UserThoughtsChangedEmitter;
import com.nogenem.skyapp.socketEventData.MemberLastSeenChanged;
import com.nogenem.skyapp.socketEventData.UserSignedIn;
import com.nogenem.skyapp.socketEventData.UserSignedOut;
import com.nogenem.skyapp.socketEventData.UserStatusChanged;

import org.json.JSONObject;
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
  private final ChannelService channelService;

  private HashMap<String, String> currentUsersChannelsIds;
  private HashMap<String, ISocketEmitter> emitters;

  public SocketIoService(ChatService chatService, ChannelService channelService) {
    this.chatService = chatService;
    this.channelService = channelService;

    this.currentUsersChannelsIds = new HashMap<>();
    this.emitters = new HashMap<>();

    this.emitters.put(SocketEvents.IO_NEW_USER, new NewUserEmitter());
    this.emitters.put(SocketEvents.IO_PRIVATE_CHANNEL_CREATED, new PrivateChannelCreatedEmitter());
    this.emitters.put(SocketEvents.IO_GROUP_CHANNEL_CREATED, new GroupChannelCreatedEmitter());
    this.emitters.put(SocketEvents.IO_REMOVED_FROM_GROUP_CHANNEL, new RemovedFromGroupChannelEmitter());
    this.emitters.put(SocketEvents.IO_GROUP_CHANNEL_UPDATED, new GroupChannelUpdatedEmitter());
    this.emitters.put(SocketEvents.IO_MESSAGES_RECEIVED, new MessagesReceivedEmitter());
    this.emitters.put(SocketEvents.IO_MESSAGE_EDITED, new MessageEditedEmitter());
    this.emitters.put(SocketEvents.IO_MESSAGE_DELETED, new MessageDeletedEmitter());
    this.emitters.put(SocketEvents.IO_USER_STATUS_CHANGED, new UserStatusChangedEmitter());
    this.emitters.put(SocketEvents.IO_USER_THOUGHTS_CHANGED, new UserThoughtsChangedEmitter());
    this.emitters.put(SocketEvents.IO_SIGNIN, new UserSignedInEmitter());
    this.emitters.put(SocketEvents.IO_SIGNOUT, new UserSignedOutEmitter());
    this.emitters.put(SocketEvents.IO_SET_LAST_SEEN, new SetLastSeenEmitter());
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

        this.emit(SocketEvents.IO_SIGNIN, new UserSignedIn(currentUserId));
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
        this.emit(SocketEvents.IO_SIGNOUT, new UserSignedOut(currentUserId));

        if (this.currentUsersChannelsIds.containsKey(currentUserId)) {
          this.currentUsersChannelsIds.remove(currentUserId);
          socket.leaveRoom(currentUserId);
        }
      });

      socket.on(SocketEvents.IO_SET_ACTIVE_CHANNEL, (Object... args2) -> {
        JSONObject tmp = (JSONObject) args2[0];
        String channelId = tmp.getString("channelId");
        Instant lastSeen = Instant.now();

        // update the last channel that the user was in
        String currentChannelId = this.currentUsersChannelsIds.get(currentUserId);
        if (this.currentUsersChannelsIds.containsKey(currentUserId)
            && currentChannelId != null && !currentChannelId.isEmpty()) {
          this.channelService.updateMemberLastSeen(
              this.currentUsersChannelsIds.get(currentUserId), currentUserId, lastSeen);
        }

        this.currentUsersChannelsIds.put(currentUserId, channelId);

        if (channelId != null && !channelId.isEmpty()) {
          Channel channel = this.channelService.updateMemberLastSeen(channelId, currentUserId, lastSeen);
          if (channel != null) {
            ChatChannelDTO channelDTO = new ChatChannelDTO(channel, null, 0);

            this.emit(SocketEvents.IO_SET_LAST_SEEN,
                new MemberLastSeenChanged(channelDTO, currentUserId, lastSeen));
          }
        }
      });

      socket.on(SocketEvents.IO_SET_LAST_SEEN, (Object... args2) -> {
        JSONObject tmp = (JSONObject) args2[0];
        String channelId = tmp.getString("channelId");
        Instant lastSeen = Instant.now();

        if (channelId != null && !channelId.isEmpty()) {
          Channel channel = this.channelService.updateMemberLastSeen(channelId, currentUserId, lastSeen);
          if (channel != null) {
            ChatChannelDTO channelDTO = new ChatChannelDTO(channel, null, 0);

            this.emit(SocketEvents.IO_SET_LAST_SEEN,
                new MemberLastSeenChanged(channelDTO, currentUserId, lastSeen));
          }
        }
      });

      socket.on(SocketEvents.IO_USER_STATUS_CHANGED, (Object... args2) -> {
        JSONObject tmp = (JSONObject) args2[0];
        UserStatus newStatus = UserStatus.fromInt(tmp.getInt("newStatus"));

        this.emit(SocketEvents.IO_USER_STATUS_CHANGED,
            new UserStatusChanged(currentUserId, newStatus));
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
