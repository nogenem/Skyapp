package com.nogenem.skyapp.socketEmitters;

import java.util.HashMap;
import java.util.Set;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
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

    ChatChannelDTO channelDTO = tmpData.getChannelDTO();
    HashMap<String, Integer> unreadMessagesHash = tmpData.getUnreadMessagesHash();

    JSONObject obj = channelDTO.toJSON();

    for (ChatMemberDTO memberDTO : channelDTO.getMembers()) {
      String userId = memberDTO.getUserId();

      obj.put("unreadMsgs", unreadMessagesHash.get(userId));

      namespace.broadcast(
          userId,
          SocketEvents.IO_GROUP_CHANNEL_UPDATED,
          obj);
    }
  }

}
