#FROM node:10-buster-slim AS build

#WORKDIR /build
#ADD . /build

#RUN echo "deb http://archive.debian.org/debian stretch main contrib non-free" > /etc/apt/sources.list
#RUN echo "deb http://archive.debian.org/debian-security stretch/updates main contrib non-free" > /etc/apt/sources.list
#RUN apt update && apt install --yes git binutils
#RUN npm install
#RUN npm run build

FROM alpine:latest

RUN apk add --update --no-cache lighttpd

ADD lighttpd.conf /etc/lighttpd/lighttpd.conf
COPY /dist /app
COPY /assets/docker_init /app/start
#COPY --from=build /build/dist /app
#COPY --from=build /build/assets/docker_init /app/start

EXPOSE 80

ENTRYPOINT ["lighttpd", "-D"]
CMD ["-f", "/etc/lighttpd/lighttpd.conf"]
