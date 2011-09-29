/** @constructor */
function sourceTestClass() {
  this.myField_ = 'sourceTestClassField';
};

sourceTestClass.ObjName = 'sourceTestClass#Name';

sourceTestClass.srcClassName = function() {
  return 'sourceTestClass';
};

sourceTestClass.prototype.srcClassName = function() {
  return sourceTestClass.srcClassName() + '#proxy';
};

sourceTestClass.prototype.getSrcName = function() {
  return this.myField_;
};

/** @constructor */
function targetTestClass() {
  this.myField_ = 'targetTestClassField';
};

targetTestClass.ClassName = function() {
  return 'targetTestClass';
};

targetTestClass.prototype.getName = function() {
  return this.myField_;
};

