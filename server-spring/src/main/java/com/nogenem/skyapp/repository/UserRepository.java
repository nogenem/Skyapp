package com.nogenem.skyapp.repository;

import java.util.List;
import java.util.Optional;

import com.nogenem.skyapp.model.User;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

  public Optional<User> findByEmail(String email);

  public Optional<User> findByConfirmationToken(String confirmationToken);

  public Optional<User> findByResetPasswordToken(String resetPasswordToken);

  @Query(value = "{ '_id': { $ne: ?0 }, 'confirmed': true }", fields = "{ '_id': 1, 'nickname': 1, 'thoughts': 1, 'status': 1 }")
  List<User> findOtherUsers(String userId);

  @Query(value = "{ '_id': { $in: ?0 } }", fields = "{ '_id': 1, 'nickname': 1 }")
  List<User> findUsersNickname(Object[] usersIds);

  @Query(value = "{ '_id': { $in: ?0 } }", count = true)
  Integer countUsersIn(Object[] usersIds);

}
