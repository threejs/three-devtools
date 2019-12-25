export default (() => {

const utils = {
  hideObjectFromTools: (object) => {
    object.userData.fromDevtools = true;
  },

  isHiddenFromTools: (object) => {
    return !!(object.userData && object.userData.fromDevtools);
  },
};

return utils;

});
