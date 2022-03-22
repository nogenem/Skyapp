package com.nogenem.skyapp.socketEmitters;

import java.util.Set;

import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.socketEventData.UserSignedOut;

import io.socket.socketio.server.SocketIoNamespace;

public class UserSignedOutEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> usersIds, ISocketEventData data) {
    UserSignedOut tmp = (UserSignedOut) data;

    for (String userId : usersIds) {
      namespace.broadcast(userId, SocketEvents.IO_SIGNOUT, tmp.getUserId());
    }
  }

}
