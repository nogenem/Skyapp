package com.nogenem.skyapp.socketEmitters;

import java.util.List;
import java.util.Set;

import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.socketEventData.RemovedFromGroupChannel;

import org.json.JSONObject;

import io.socket.socketio.server.SocketIoNamespace;

public class RemovedFromGroupChannelEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> clientsIds, ISocketEventData data) {
    RemovedFromGroupChannel tmpData = (RemovedFromGroupChannel) data;

    String channelId = tmpData.getChannelDTO().get_id();
    List<String> membersIds = tmpData.getMembersIds();

    JSONObject obj = new JSONObject();
    obj.put("channelId", channelId);

    for (int i = 0; i < membersIds.size(); i++) {
      namespace.broadcast(
          membersIds.get(i),
          SocketEvents.IO_REMOVED_FROM_GROUP_CHANNEL,
          obj);
    }
  }

}
