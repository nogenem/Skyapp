package com.nogenem.skyapp.socketEmitters;

import java.util.HashMap;
import java.util.List;
import java.util.Set;

import com.nogenem.skyapp.DTO.ChatMemberDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.socketEventData.GroupChannelUpdated;

import org.json.JSONObject;

import io.socket.socketio.server.SocketIoNamespace;

public class GroupChannelUpdatedEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> clientsIds, ISocketEventData data) {
    GroupChannelUpdated tmpData = (GroupChannelUpdated) data;

    JSONObject channel = tmpData.getChannel().toJSON();
    HashMap<String, Integer> unreadMessagesHash = tmpData.getUnreadMessagesHash();

    List<ChatMemberDTO> members = tmpData.getChannel().getMembers();
    for (int i = 0; i < members.size(); i++) {
      String userId = members.get(i).getUserId();

      channel.put("unreadMsgs", unreadMessagesHash.get(userId));

      namespace.broadcast(
          userId,
          SocketEvents.IO_GROUP_CHANNEL_UPDATED,
          channel);
    }
  }

}
