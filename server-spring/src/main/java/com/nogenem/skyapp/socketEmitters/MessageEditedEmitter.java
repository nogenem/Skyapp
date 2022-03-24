package com.nogenem.skyapp.socketEmitters;

import java.util.Set;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMemberDTO;
import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.socketEventData.MessageEdited;

import org.json.JSONObject;

import io.socket.socketio.server.SocketIoNamespace;

public class MessageEditedEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> clientsIds, ISocketEventData data) {
    MessageEdited tmpData = (MessageEdited) data;

    ChatChannelDTO channelDTO = tmpData.getChannelDTO();
    ChatMessageDTO messageDTO = tmpData.getMessageDTO();
    String fromId = messageDTO.getFromId();

    JSONObject obj = messageDTO.toJSON();

    for (ChatMemberDTO memberDTO : channelDTO.getMembers()) {
      String userId = memberDTO.getUserId();
      if (fromId == null || fromId.isEmpty() || !fromId.equals(userId)) {
        namespace.broadcast(
            userId,
            SocketEvents.IO_MESSAGE_EDITED,
            obj);
      }
    }
  }

}
