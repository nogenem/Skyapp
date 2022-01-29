package com.nogenem.skyapp.socketEmitters;

import java.util.List;
import java.util.Set;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMemberDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;

import io.socket.socketio.server.SocketIoNamespace;

public class PrivateChannelCreatedEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> clientsIds, ISocketEventData data) {
    ChatChannelDTO channel = (ChatChannelDTO) data;
    List<ChatMemberDTO> members = channel.getMembers();

    for (int i = 0; i < members.size(); i++) {
      channel.setOtherMemberIdx(i == 0 ? 1 : 0);
      namespace.broadcast(members.get(i).getUserId(), SocketEvents.IO_PRIVATE_CHANNEL_CREATED, channel.toJSON());
    }
  }

}
