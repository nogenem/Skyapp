package com.nogenem.skyapp.socketEmitters;

import java.util.List;
import java.util.Set;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMemberDTO;
import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.socketEventData.MessagesReceived;

import org.json.JSONArray;

import io.socket.socketio.server.SocketIoNamespace;

public class MessagesReceivedEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> clientsIds, ISocketEventData data) {
    MessagesReceived tmpData = (MessagesReceived) data;

    ChatChannelDTO channelDTO = tmpData.getChannelDTO();
    List<ChatMessageDTO> messagesDTOs = tmpData.getMessagesDTOs();
    String fromId = messagesDTOs.get(0).getFromId();

    JSONArray arr = new JSONArray();
    for (ChatMessageDTO messageDTO : messagesDTOs) {
      arr.put(messageDTO.toJSON());
    }

    for (ChatMemberDTO memberDTO : channelDTO.getMembers()) {
      String userId = memberDTO.getUserId();
      if (fromId == null || fromId.isEmpty() || !fromId.equals(userId)) {
        namespace.broadcast(
            userId,
            SocketEvents.IO_MESSAGES_RECEIVED,
            arr);
      }
    }
  }

}
