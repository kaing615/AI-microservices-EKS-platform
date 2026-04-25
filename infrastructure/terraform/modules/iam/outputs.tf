output "github_actions_role_arn" {
  value = var.github_oidc_provider_arn == "" ? null : aws_iam_role.github_actions[0].arn
}

