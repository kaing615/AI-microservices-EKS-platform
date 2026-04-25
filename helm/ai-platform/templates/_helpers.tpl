{{- define "ai-platform.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "ai-platform.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (include "ai-platform.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "ai-platform.labels" -}}
app.kubernetes.io/name: {{ include "ai-platform.name" . }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "ai-platform.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ai-platform.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "ai-platform.componentName" -}}
{{- . | kebabcase -}}
{{- end -}}

{{- define "ai-platform.componentLabels" -}}
{{- $root := .root -}}
{{- $component := .component -}}
app.kubernetes.io/component: {{ include "ai-platform.componentName" $component }}
{{ include "ai-platform.selectorLabels" $root }}
{{- end -}}

{{- define "ai-platform.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "ai-platform.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}
