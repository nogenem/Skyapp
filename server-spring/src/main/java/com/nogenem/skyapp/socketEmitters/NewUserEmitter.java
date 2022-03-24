package com.nogenem.skyapp.socketEmitters;

import java.util.Set;

import com.nogenem.skyapp.DTO.UserDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.interfaces.ISocketEmitter;
import com.nogenem.skyapp.interfaces.ISocketEventData;

import org.json.JSONObject;

import io.socket.socketio.server.SocketIoNamespace;

public class NewUserEmitter implements ISocketEmitter {

  @Override
  public void emit(SocketIoNamespace namespace, Set<String> usersIds, ISocketEventData data) {
    UserDTO userDTO = (UserDTO) data;

    JSONObject obj = userDTO.toJSON();

    for (String userId : usersIds) {
      namespace.broadcast(userId, SocketEvents.IO_NEW_USER, obj);
    }
  }

}
