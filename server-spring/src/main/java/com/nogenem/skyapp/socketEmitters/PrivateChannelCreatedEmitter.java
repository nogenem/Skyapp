package com.nogenem.skyapp.socketEmitters;

import java.util.List;
import java.util.Set;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMemberDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;

import org.json.JSONObject;

import io.socket.socketio.server.SocketIoNamespace;

public class PrivateChannelCreatedEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> clientsIds, ISocketEventData data) {
    ChatChannelDTO channelDTO = (ChatChannelDTO) data;
    List<ChatMemberDTO> membersDTOs = channelDTO.getMembers();

    JSONObject obj = channelDTO.toJSON();

    for (int i = 0; i < membersDTOs.size(); i++) {
      channelDTO.setOtherMemberIdx(i == 0 ? 1 : 0);

      namespace.broadcast(membersDTOs.get(i).getUserId(), SocketEvents.IO_PRIVATE_CHANNEL_CREATED, obj);
    }
  }

}
