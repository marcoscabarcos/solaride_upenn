import { firestore } from './firebase';

//Get the user object from the realtime database
export const getRestaurants = async () => {
  console.log('GET RESTAURANTS');
  var returnArr = [];
  var restaurantsRef = firestore.collection('restaurants');
  await restaurantsRef
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        returnArr.push(doc.data());
      });
    })
    .catch(error => console.log(error));
  console.log('GET RESTAURANTS RETURNED');
  return returnArr;
};
