package com.nogenem.skyapp.socketEmitters;

import java.util.Set;

import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.socketEventData.MemberLastSeenChanged;

import org.json.JSONObject;

import io.socket.socketio.server.SocketIoNamespace;

public class SetLastSeenEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> usersIds, ISocketEventData data) {
    MemberLastSeenChanged tmp = (MemberLastSeenChanged) data;

    JSONObject obj = new JSONObject();
    obj.put("channelId", tmp.getChannelDTO().get_id());
    obj.put("userId", tmp.getUserId());
    obj.put("lastSeen", tmp.getLastSeen().toString());

    for (String userId : usersIds) {
      namespace.broadcast(userId, SocketEvents.IO_SET_LAST_SEEN, obj);
    }
  }

}
