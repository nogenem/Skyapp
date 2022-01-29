package com.nogenem.skyapp.interfaces;

import java.util.Set;

import io.socket.socketio.server.SocketIoNamespace;

public interface ISocketEmitter {
  public void emit(SocketIoNamespace namespace, Set<String> clientsIds, ISocketEventData data);
}
