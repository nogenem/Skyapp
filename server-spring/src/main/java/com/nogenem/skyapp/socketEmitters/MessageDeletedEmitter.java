package com.nogenem.skyapp.socketEmitters;

import java.util.List;
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

    ChatChannelDTO channelDTO = tmpData.getChannel();
    ChatMessageDTO messageDTO = tmpData.getMessage();
    ChatMessageDTO lastMessageDTO = tmpData.getLastMessage();
    String fromId = messageDTO.getFromId();

    JSONObject message = messageDTO.toJSON();
    JSONObject lastMessage = lastMessageDTO != null ? lastMessageDTO.toJSON() : null;

    JSONObject ret = new JSONObject();
    ret.put("message", message);
    ret.put("lastMessage", lastMessage != null ? lastMessage : JSONObject.NULL);

    List<ChatMemberDTO> members = channelDTO.getMembers();
    for (int i = 0; i < members.size(); i++) {
      String userId = members.get(i).getUserId();
      if (fromId == null || fromId.isEmpty() || !fromId.equals(userId)) {
        namespace.broadcast(
            userId,
            SocketEvents.IO_MESSAGE_DELETED,
            ret);
      }
    }
  }

}
