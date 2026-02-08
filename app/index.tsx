import { Redirect } from 'expo-router';

export default function Index() {
  // check the user alredy login
  
  // not a login user redirect welcome page 
  return <Redirect href="/welcome" />;
}