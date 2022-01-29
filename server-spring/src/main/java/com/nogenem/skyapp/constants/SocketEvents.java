package com.nogenem.skyapp.constants;

public interface SocketEvents {
  public static final String SOCKET_CONNECT = "connect";
  public static final String SOCKET_DISCONNECT = "disconnect";

  public static final String IO_GET_INITIAL_DATA = "CHAT:GET_INITIAL_DATA";
  public static final String IO_NEW_USER = "AUTH:NEW_USER";
  public static final String IO_PRIVATE_CHANNEL_CREATED = "CHAT:PRIVATE_CHANNEL_CREATED";
}
