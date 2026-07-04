package ai_brain.authz

default allow = false

# Deny plugin enable when id is in blocked list (Phase 17 / 20 integration).
allow {
  input.action == "plugin.enable"
  not blocked_plugin(input.resource.id)
}

blocked_plugin(id) {
  id == input.data.blocked_plugin_ids[_]
}
