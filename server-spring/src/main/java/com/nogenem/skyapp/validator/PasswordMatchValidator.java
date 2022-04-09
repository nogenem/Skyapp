package com.nogenem.skyapp.validator;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import com.nogenem.skyapp.annotation.PasswordMatch;
import com.nogenem.skyapp.interfaces.IHasPasswordAndConfirmation;

public class PasswordMatchValidator implements ConstraintValidator<PasswordMatch, IHasPasswordAndConfirmation> {

  @Override
  public boolean isValid(IHasPasswordAndConfirmation value, ConstraintValidatorContext context) {
    if(value.getPassword() == null && value.getPasswordConfirmation() == null) {
      return true;
    } else if(value.getPassword() == null || value.getPasswordConfirmation() == null) {
      return false;
    }
    return value.getPassword().equals(value.getPasswordConfirmation());
  }

}
