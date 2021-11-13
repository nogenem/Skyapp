class TmpFile {
  protected _id: string;
  protected _file: File;

  constructor(file: File) {
    this._file = file;
    this._id = new Date().getTime() + Math.random() + this.size() + this.name();
  }

  id() {
    return this._id;
  }

  name() {
    return this._file.name;
  }

  type() {
    return this._file.type;
  }

  size() {
    return this._file.size;
  }

  file() {
    return this._file;
  }
}

export default TmpFile;
