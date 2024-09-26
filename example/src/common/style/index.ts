import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  disclaimer: {
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 20,
    color: 'red',
    backgroundColor: 'yellow',
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
