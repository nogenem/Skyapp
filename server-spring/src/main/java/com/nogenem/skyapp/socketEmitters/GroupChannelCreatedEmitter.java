package com.nogenem.skyapp.socketEmitters;

import java.util.Set;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMemberDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;

import org.json.JSONObject;

import io.socket.socketio.server.SocketIoNamespace;

public class GroupChannelCreatedEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> clientsIds, ISocketEventData data) {
    ChatChannelDTO channelDTO = (ChatChannelDTO) data;

    JSONObject obj = channelDTO.toJSON();

    for (ChatMemberDTO memberDTO : channelDTO.getMembers()) {
      namespace.broadcast(memberDTO.getUserId(), SocketEvents.IO_GROUP_CHANNEL_CREATED, obj);
    }
  }

}
