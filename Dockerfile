FROM alpine:latest

RUN apk add --update --no-cache lighttpd

ADD lighttpd.conf /etc/lighttpd/lighttpd.conf
COPY /dist /app
COPY /assets/docker_init /app/start

EXPOSE 80

ENTRYPOINT ["lighttpd", "-D"]
CMD ["-f", "/etc/lighttpd/lighttpd.conf"]
