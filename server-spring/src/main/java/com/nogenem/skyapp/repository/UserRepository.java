package com.nogenem.skyapp.repository;

import java.util.List;

import com.nogenem.skyapp.model.User;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

  public User findByEmail(String email);

  public User findByConfirmationToken(String confirmationToken);

  public User findByResetPasswordToken(String resetPasswordToken);

  @Query(value = "{ '_id': { $ne: ?0 }, 'confirmed': true }", fields = "{ '_id': 1, 'nickname': 1, 'thoughts': 1, 'status': 1 }")
  List<User> getOtherUsers(String userId);

}
