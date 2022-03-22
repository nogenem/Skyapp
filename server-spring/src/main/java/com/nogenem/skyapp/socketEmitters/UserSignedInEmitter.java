package com.nogenem.skyapp.socketEmitters;

import java.util.Set;

import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.socketEventData.UserSignedIn;

import io.socket.socketio.server.SocketIoNamespace;

public class UserSignedInEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> usersIds, ISocketEventData data) {
    UserSignedIn tmp = (UserSignedIn) data;

    for (String userId : usersIds) {
      namespace.broadcast(userId, SocketEvents.IO_SIGNIN, tmp.getUserId());
    }
  }

}
