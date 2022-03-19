package com.nogenem.skyapp.socketEmitters;

import java.util.List;
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

    ChatChannelDTO channelDTO = tmpData.getChannel();
    ChatMessageDTO messageDTO = tmpData.getMessage();
    String fromId = messageDTO.getFromId();

    JSONObject message = messageDTO.toJSON();

    List<ChatMemberDTO> members = channelDTO.getMembers();
    for (int i = 0; i < members.size(); i++) {
      String userId = members.get(i).getUserId();
      if (fromId == null || fromId.isEmpty() || !fromId.equals(userId)) {
        namespace.broadcast(
            userId,
            SocketEvents.IO_MESSAGE_EDITED,
            message);
      }
    }
  }

}
