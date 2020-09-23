# Sengi's Docker documentation

Here is some more detailed informations for Sengi's Docker users.

## Deploy Sengi's

Execute:

```
docker run -d -p 80:80 nicolasconstant/sengi
```

Sengi will then be available on port 80

## Landing page 

Sengi's docker contains a landing page so that you can open a pop-up easily.<br />
It's available in ```https://your-host/start/index.html```

## Personalize the Privacy Statement

You can personalize the privacy statement by linking it as follow:

```
docker run -d -p 80:80 -v /Path/privacy.html:/app/assets/docs/privacy.html nicolasconstant/sengi
```


