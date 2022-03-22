package com.nogenem.skyapp.constants;

public interface SocketEvents {
  public static final String SOCKET_CONNECT = "connect";
  public static final String SOCKET_DISCONNECT = "disconnect";

  public static final String IO_SIGNIN = "AUTH:SIGNIN";
  public static final String IO_NEW_USER = "AUTH:NEW_USER";

  public static final String IO_GET_INITIAL_DATA = "CHAT:GET_INITIAL_DATA";
  public static final String IO_PRIVATE_CHANNEL_CREATED = "CHAT:PRIVATE_CHANNEL_CREATED";
  public static final String IO_GROUP_CHANNEL_CREATED = "CHAT:GROUP_CHANNEL_CREATED";
  public static final String IO_REMOVED_FROM_GROUP_CHANNEL = "CHAT:REMOVED_FROM_GROUP_CHANNEL";
  public static final String IO_GROUP_CHANNEL_UPDATED = "CHAT:GROUP_CHANNEL_UPDATED";
  public static final String IO_MESSAGES_RECEIVED = "CHAT:MESSAGES_RECEIVED";
  public static final String IO_MESSAGE_EDITED = "CHAT:MESSAGE_EDITED";
  public static final String IO_MESSAGE_DELETED = "CHAT:MESSAGE_DELETED";
  public static final String IO_USER_STATUS_CHANGED = "CHAT:USER_STATUS_CHANGED";
  public static final String IO_USER_THOUGHTS_CHANGED = "CHAT:USER_THOUGHTS_CHANGED";
}
