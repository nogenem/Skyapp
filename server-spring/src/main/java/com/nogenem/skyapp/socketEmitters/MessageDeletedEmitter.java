package com.nogenem.skyapp.socketEmitters;

import java.util.Set;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMemberDTO;
import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.socketEventData.MessageDeleted;

import org.json.JSONObject;

import io.socket.socketio.server.SocketIoNamespace;

public class MessageDeletedEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> clientsIds, ISocketEventData data) {
    MessageDeleted tmpData = (MessageDeleted) data;

    ChatChannelDTO channelDTO = tmpData.getChannelDTO();
    ChatMessageDTO messageDTO = tmpData.getMessageDTO();
    ChatMessageDTO lastMessageDTO = tmpData.getLastMessageDTO();
    String fromId = messageDTO.getFromId();

    JSONObject obj = new JSONObject();
    obj.put("message", messageDTO.toJSON());
    obj.put("lastMessage", lastMessageDTO != null ? lastMessageDTO.toJSON() : JSONObject.NULL);

    for (ChatMemberDTO memberDTO : channelDTO.getMembers()) {
      String userId = memberDTO.getUserId();
      if (fromId == null || fromId.isEmpty() || !fromId.equals(userId)) {
        namespace.broadcast(
            userId,
            SocketEvents.IO_MESSAGE_DELETED,
            obj);
      }
    }
  }

}
