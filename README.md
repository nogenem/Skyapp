<h1 align="center">
  Skyapp
</h1>
<h4 align="center">
  A simple chat system.
</h4>

## Requirements

- [Node JS](https://nodejs.org/en/)
- [Java](https://www.java.com/pt-BR/)
- [Maven](https://maven.apache.org/)
- [Mongodb](https://www.mongodb.com/)
  - Here you could install mongo locally on your machine, use docker or even use an online option, like the one provided by mongodb itself
- [Yarn](https://yarnpkg.com/)

## How to use

1. Make sure you have fulfilled all requirements

2. Clone the repository
```bash
git clone https://github.com/nogenem/Skyapp.git
```

3. Install all dependencies
```bash
cd Skyapp
yarn install
cd client-react
yarn install
cd ../server-node
yarn install
cd ../server-spring
./mvnw clean install
cd ..
```

4. Make a copy of the file `.env.BASE` and rename it to `.env`
```bash
cp ./client-react/.env.BASE ./client-react/.env
cp ./server-node/.env.BASE ./server-node/.env
cp ./server-spring/src/main/resources/.env.BASE ./server-spring/src/main/resources/.env
cp ./server-spring/src/test/resources/.env.BASE ./server-spring/src/test/resources/.env
```

5. Edit the content of `client-react/.env`, if necessary, can leave like that in development

6. Edit the content of `server-node/.env`
  - `MONGO_URI` comes from mongodb
    - It can be a local url `mongodb://localhost:27017/skyapp` or an online url `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/skyapp`
  - `JWT_SECRET` can be anything
  - `EMAIL_*` can be a real email or the data got from services like [mailtrap](https://mailtrap.io/)
  - `PORT` is optional and the default is 5000
  - `DEBUG` is optional

7. Edit the content of `server-spring/src/main/resources/.env` and `server-spring/src/test/resources/.env`
  - `MONGO_URI` comes from mongodb
    - It can be a local url `mongodb://localhost:27017/skyapp` or an online url `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/skyapp`
  - `MONGO_DBNAME` Name of the database, can leave the default one
  - `MONGO_PORT` Port to be used by Mongodb, its only used while doing *tests*
  - `JWT_SECRET` can be anything
  - `EMAIL_` can be a real email or the data got from services like [mailtrap](https://mailtrap.io/)
  - `PORT` is optional and the default is 5000

8. Start the script to choose which client/server to use
```bash
yarn start
```

## Commit messages
I decided to use `p01~XX` as alias to the subprojects names in the commit messages to standardize the size of the prefix, instead of using things like `react: ...` or `node: ...`. For reference, these are all the aliases:

- p01 = react
- p02 = node
- p03 = spring
- ...

## Some images from the client-react

### Sign in
![Sign in](https://user-images.githubusercontent.com/2437497/147275586-e3b9699c-41e2-4250-8eff-f58d3ae737ac.png)

### Chat
![Chat](https://user-images.githubusercontent.com/2437497/147275602-7074a3d9-9754-4066-be6b-68b54cb77167.png)

### Preview files before sending
![Preview files before sending](https://user-images.githubusercontent.com/2437497/147277442-2b0f80d0-3f90-4991-8768-beca0637d7bb.png)

### Create a group modal
![Create a group modal](https://user-images.githubusercontent.com/2437497/147275623-13e44c1e-22cd-4a79-8d52-4120935d8ed6.png)
