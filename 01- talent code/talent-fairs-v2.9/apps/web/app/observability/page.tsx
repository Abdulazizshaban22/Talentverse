'use client'
export default function Obs(){
  return <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
    <h2>المراقبة والتنبيهات</h2>
    <ol>
      <li>أضِف لوحة Grafana JSON من <code>observability/grafana/dashboards/node_full.json</code>.</li>
      <li>فعّل Alertmanager باستخدام <code>observability/alertmanager/alertmanager.yml</code>، والـRules من <code>observability/prometheus/rules/alerts.yml</code>.</li>
      <li>اضبط Contact Points في Grafana (Email/Slack/Webhook) من الواجهة.</li>
    </ol>
  </main>
}
