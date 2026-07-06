FROM quay.io/keycloak/keycloak:26.0.7

COPY realm-ratary.json /opt/keycloak/data/import/realm-ratary.json

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev", "--import-realm", "--http-enabled=true", "--hostname-strict=false", "--proxy-headers=xforwarded"]
