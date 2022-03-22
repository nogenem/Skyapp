package com.nogenem.skyapp.socketEmitters;

import java.util.Set;

import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.socketEventData.UserStatusChanged;

import org.json.JSONObject;

import io.socket.socketio.server.SocketIoNamespace;

public class UserStatusChangedEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> usersIds, ISocketEventData data) {
    UserStatusChanged tmp = (UserStatusChanged) data;

    JSONObject obj = new JSONObject();
    obj.put("userId", tmp.getUserId());
    obj.put("newStatus", tmp.getNewStatus().getValue());

    for (String userId : usersIds) {
      if(!userId.equals(tmp.getUserId())) {
        namespace.broadcast(userId, SocketEvents.IO_USER_STATUS_CHANGED, obj);
      }
    }
  }

}
