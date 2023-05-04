/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authorize, prefetchConfiguration } from 'react-native-app-auth';
import * as Keychain from 'react-native-keychain';
const defaultAuthState = {
  hasLoggedInOnce: false,
  provider: '',
  accessToken: '',
  accessTokenExpirationDate: '',
  refreshToken: ''
};
export default () => {
  const [authState, setAuthState] = useState(defaultAuthState);
  const [userinfo, setuserinfo] = useState(null)
  React.useEffect(() => {
    prefetchConfiguration({
      warmAndPrefetchChrome: true,
      ...configs.fusionauth
    });
  }, []);
  const configs = {
    fusionauth: {
      issuer: 'https://ce25267ff5a5.ngrok.io',
      clientId: '253eb7aa-687a-4bf3-b12b-26baa40eecbf',
      redirectUrl: 'fusionauth-demo:/oauthredirect',
      additionalParameters: {},
      scopes: ['offline_access'],
    }
  }

  const getAccesstoken = async () => {
    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {

        return credentials.password

      } else {
        console.log('No credentials stored');
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error);
    }
  }
  const getUser = async () => {
    try {
      const access_token = await getAccesstoken();
      if (access_token !== null) {
        fetch(configs.fusionauth.issuer + "/oauth2/userinfo", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + access_token,
          },
        })
          .then((response) => response.json())
          .then((json) => {
            console.log(json);
            setuserinfo(json);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleAuthorize = useCallback(
    async () => {
      try {
        const newAuthState = await authorize(configs.fusionauth);
        console.log(newAuthState)
        setAuthState({
          hasLoggedInOnce: true,
          ...newAuthState
        });
        await Keychain.setGenericPassword('accessToken', newAuthState.accessToken);
      } catch (error) {
        Alert.alert('Failed to log in', error.message);
      }
    },
    [authState]
  );


  return (
    <View style={styles.container}>
      <Image
        source={require('./fusionauth.png')}
      />
      {authState.accessToken ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => getUser()}
        >
          <Text style={styles.buttonText}>Get User</Text>
        </TouchableOpacity>
      ) : (<TouchableOpacity
        style={styles.button}
        onPress={() => handleAuthorize()}

      >
        <Text style={styles.buttonText}>Login with FusionAuth</Text>
      </TouchableOpacity>)}
      {userinfo ? (
        <View style={styles.userInfo}>
          <View>
            <Text style={styles.userInfoText}>
              Username:{userinfo.given_name}
            </Text>
            <Text style={styles.userInfoText}></Text>
            <Text style={styles.userInfoText}>Email:{userinfo.email}</Text>
            <Text style={styles.userInfoText}></Text>

          </View>
        </View>
      ) : (
          <View></View>
        )}

    </View>
  );

}


const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: "grey",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  button: {
    backgroundColor: "#f58321",
    padding: 20
  },
  buttonText: {
    color: "#000",
    fontSize: 20,
  },
  userInfo: {
    height: 300,
    width: 300,
    alignItems: "center",
  },
  userInfoText: {
    color: "#fff",
    fontSize: 18,
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
  },
  profileImage: {
    height: 64,
    width: 64,
    marginBottom: 32,
  },
});
