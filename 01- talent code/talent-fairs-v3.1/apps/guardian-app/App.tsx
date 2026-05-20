import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, TextInput, Button, ScrollView } from 'react-native';

const API_BASE = process.env.API_BASE || 'http://localhost:4000';

export default function App(){
  const [studentId, setStudentId] = useState('demo');
  const [out, setOut] = useState<any>(null);
  const [msg, setMsg] = useState<string>('');

  async function load(){
    setMsg(''); try {
      const r = await fetch(`${API_BASE}/profile/${studentId}`);
      const dj = await r.json(); setOut(dj);
    } catch(e:any){ setMsg(String(e)); }
  }
  async function grant(){
    setMsg(''); try {
      const r = await fetch(`${API_BASE}/consents`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({studentId, purpose:'school_assessment', grant:true, grantedBy:'guardian_app'}) });
      const dj = await r.json(); setMsg(dj.msg||'ok');
    } catch(e:any){ setMsg(String(e)); }
  }

  return <SafeAreaView style={{flex:1}}>
    <ScrollView contentContainerStyle={{padding:20, gap:10}}>
      <Text style={{fontSize:22, fontWeight:'600'}}>Talent Guardian</Text>
      <Text>أدخل معرف الطالب:</Text>
      <TextInput value={studentId} onChangeText={setStudentId} style={{borderWidth:1, padding:8, borderRadius:6}} />
      <View style={{flexDirection:'row', gap:8}}>
        <Button title="عرض الملف" onPress={load} />
        <Button title="منح موافقة" onPress={grant} />
      </View>
      {!!msg && <Text>{msg}</Text>}
      {!!out && <Text selectable>{JSON.stringify(out,null,2)}</Text>}
    </ScrollView>
  </SafeAreaView>
}
