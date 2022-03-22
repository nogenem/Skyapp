package com.nogenem.skyapp.socketEmitters;

import java.util.Set;

import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.socketEventData.UserThoughtsChanged;

import org.json.JSONObject;

import io.socket.socketio.server.SocketIoNamespace;

public class UserThoughtsChangedEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> usersIds, ISocketEventData data) {
    UserThoughtsChanged tmp = (UserThoughtsChanged) data;

    JSONObject obj = new JSONObject();
    obj.put("userId", tmp.getUserId());
    obj.put("newThoughts", tmp.getNewThoughts());

    for (String userId : usersIds) {
      if(!userId.equals(tmp.getUserId())) {
        namespace.broadcast(userId, SocketEvents.IO_USER_THOUGHTS_CHANGED, obj);
      }
    }
  }

}
