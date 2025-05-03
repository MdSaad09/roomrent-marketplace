// client/src/pages/dashboard/Profile.jsx
import React, { useState } from 'react';
import { FaSave, FaUser, FaEnvelope, FaPhone, FaInfoCircle } from 'react-icons/fa';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: 'Real estate enthusiast with a passion for finding the perfect home for clients.',
    avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8QDxUQDw8VFRAPFRUVDxUVDxUVFRUVFRUXFxUVFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGzUlICUtLTUvLS4rNy0uLy0tLS0tLS0uLS0tLS0wLS0tLS0tLSsuLS0tLS0tLS0tLS0tLSstLf/AABEIAOEA4QMBEQACEQEDEQH/xAAcAAEBAQACAwEAAAAAAAAAAAAAAQIFBgMEBwj/xABEEAACAQICBAsFBgMGBwAAAAAAAQIDEQQhBRIxUQYHE0FTYXGBkbHSFiJSocEjMmKS0eFCcvAUJGOTwvEzQ2RzgrKz/8QAGgEBAAIDAQAAAAAAAAAAAAAAAAEEAgMFBv/EADIRAQABAgIHBgYCAwEAAAAAAAABAgMR0QQFFSExUaESQVJxgfATIjJhkbFC4QaS8TP/2gAMAwEAAhEDEQA/APsoAABIu4FAAAAAABQFgFgFgFgFgFgAEAkXdXAoAAAAAAAACgQABmTAsQKAAAALYCMCqIFQFsBbALASwCwEsBhsCpAUCAAAACMABUwKBAMuQCKA0AAAUCpAWwEiBdoFSAtgPRlpjCKWo8VQU9mq69NSv2XuB7sc1dZp7GtjAtgIBiTv2AWMQLYCWAlgIAAASLAr3+ABICgRoDMYgaAAALYCpAaAAGgDaSbbskrtvJJc7e5AfMeGvG3Sw8lS0ZyWInnytSTm6UGraqjq25W+ecZWVusD5vwj4xNJ4+lyNarCFJu8o0ISp6/VNuTbj1XtvuQOpai2WVuwD3MHpPE0YuFDE1qUHtjTxFSnF9sYySA9/D8K9JU4xjHH4jVhONRJ15yWtFpq+s22sl7ry6gPpHAfjYr18TTwukIU2q8lCnWpxcGpydoKcbtNNtK6ta6ya2SPr6Wee3cBqwEAARoDLAgAA0AQACgQAAAAUDSQFAtgKBJyUU5SaUYpuTbsklm23zID888ZXGDU0jUlh8NJwwEG0ksniGv45/g+GHe88owOhpgaa513rd+wGQAFS53s8+pAVTaaabTi04tNpxad009qd87geSliZKtCvJKpOnOM/tdaak4tO087uLtZq+abA/QvF1xg0tKJ0alNUcXTjrOCd4VIKyc6d81a6vF7LrNkjvAEAgEaAjAyAAAAKBAAACoDSAoFAoFSA+V8fempU8NRwUJNf2qUp1rc9Ola0X1OUov/AMAPh5AAVMCtc671u/YCJc72efUgDdwIAA5Lg1pV4PG0MUnbkKsZT/7berUXfByXeB+smiRAIBAI0BlgQAAAoEAAVAVIDQFAoFSAoH5247MdyumJwTyw1KlStubTqv8A+i8CB0MD6Xwb4qJ1qMauMryoyqJSjShBOcU9nKOWx2t7tst/MtVV3CdzbTaxje8WluKPGQl/da9KrD/EvSmurJSjLtuuwRdjvJtT3PQpcVulr5xopb3iF9IvyJ+LSj4VTlqHE9iJJOrjaUJWzjCjOol2Sco38CPjRyZfBnm9bEcUGOU7U8Th5Q+KXKU5fkUZeY+NCJtSlfiix6jeGIw8pfC3Uj4S1WPjQfCl0fSujK+FquhiaTp1Y5uLtmnslFrKUXZ5rc9xsiYng1zExul6VRXi1vTJQ/XWhMRyuFoVb35WjSnffrQi/qSPcaAgEAgEYGWBAAFAgADSA0BUBQKkBQAH5b4xKuvpjGy/x5R/IlD/AEkDy8XGhv7ZpKlGSvTofbVd1qbWqu+bhluuYV1YUs6KcZfoYqrQAAAAAHSeNnQccTo+VdRXLYNOrCXPya/4sezV962+CNlurCWu5TjGL4Q2WVZ+r+B9F09G4OEvvQwuHi+2NGCfkSOXAjQEAjAgGWBAIBQIBUBpAVAaAqAoACgfljh/T1dLY1f9RUf5nrfUgfTOJrQ3I4KWKkvfxkvdyz5Km3GHjLXl2NFe7O/BYtRhGL6Amam1QAAAAA8WJoRqQlTl92pGUJdkk0/MlD8rYmlKEZQl96GtGX80bp/NMuKb9i0KajCMVsjFJdysSNgQCMCAZYEYGWBIu4FAgADSj2gaiwNIDSAAUCgfmDjUw8qemsYrP3pxnHrU6UGrd7aA+7aDoqnhKEIqyhRpRS7IRRTnjitRwe6iGakAAAAACJQ/OeOwbqaTlh6lJJYjFyhHVSTtUxDindduaLccFSeL9TXMkAEAAZAjAjA8TYFSAoAAgNAaSA0gKBUAAoHxPjswNNYqjjVa1SHI1XKK1fs25q1+dxlPug7Z7cKa4qncyqpmOL6Nopf3elfbydP/ANEVZ4rMcHtkMgAAAAAEXYlD51o/QinwjnUqR+zw0nXglvnCMlJ9evNNL8PhYiuIpiZV5omapiH16DTV1sZsicWudykgwIBGBlgeOTuAUQDAAEBbAaSA0gKgKBQKBmpG6aIkh8+4ycDGvouvCUbtcm49TVSCuu5td7KtE/Ms1x8rtDRg2AAAAAAAIBwuiMKljsdWtnOWHpp/hp4eE8u+qzKZ3QxiN8y7hhFanH+ucs2/phXr+qXmM2CAQAwMTVwMpeIBgZYAAgNIDSAqA0gAFAoFQHX9N4JVY1aLyVRNX3N5p+NipVuqWqd9LyMwZgAAAAAAAGYU1d2VnNpy63ZRu+5JdxKODnbF1TAIAAjAywIwMsDLAAEBtAVAVAaAoACgUD0MfQbetFXvtsaLtMzOMN1qqIjCXpGhvAAAAAAAAPZwdBuSbWSzv5G23RMzi1XK4wwcmWVdAIAAgGQIwIwMMAAQG0BUBUBoCgAKBQAHC1VaTW5vzKU8VyODJCQAAAAAIBzVJWiluS8i7TwhTni2ShAIAAgGQIwIwMMAAQGkBpAVAaQACgUCgAOMx9K0r80vPnK12nCcVi1VjGD1jU2gAAAAAeTD0taSXNz9hlTT2pY11YQ5guKgBAIAAgGWBGBlgZYAAgNICgWEr8wG0AAoFAAUDxYmCcGnuuu1GNcY0sqZwlw0JXVynE4rcxg0AAAAI2Jkcno2K1FLnlf5OyLNmPlxVrs/Ng9ps2tbMXdbLAUCAQAwMsCMDLAywAACoCOQG4IDaAoFQACgRsDFRe6+x+RFXBMcXXYStsOdG5f4vYhNMzicWMxg2SgAzKSW0TOA9ec7muZxZxGDnNGv7GPf5su2fohTu/XLzN3+hta2ooCgRgQCMCAeN5gRoCXAoEAjlcDcUBtAVAaQACgUDK/2A8eJlaEm9zMa5wpllRGNUOvHOXgJeRVmZdqWPZHWY7R2WG7mLJAOY0ZO9JL4W8u+5dsT8ine+p70UbmpQIBAAGQIBhfMCMCAUCNAIreBtAVAaAqAoFAAeDE4qEF7zz5ktv7Guu5TTxZ00TVwcPicVKo88lzL9d7Kldya1qi3FLwGtsAAAABGgPLQryhLWTz5+vtM6a5pnGGE0RMYS5nC46E8tktz+jLdF2mpVrtTS9k2tYBAIwIBGBiSAgEAoEAoFQGgKgKB4cXjqNGOtWqRgubWklfsXOZ0W665wpjFruXrduMa5iPN1vSHDzDQyowlUfM/uR8Xn8i/a1Zcq+qcOrlXtd2aN1ETV0j36OKwnDirUqatZRhTl91wT93+Zt3t1qxOl6rqi3jZmcY7ufkw0LXdNV3s34iKZ4Ty883OKV873vne979dzzUxMTvesiYmMYCEgAAAAAAAADiNKcL50HydBqcov39a8or8Ks7378vLv6u1dXcp7d2ZiO6O/wA/L9vNa01vRaq+HZiJqjjPd5efPl5vZ0dw/pSyr0ZQfxQetHwdmvmWbuq6430Tj57lazry3VuuU4eW92bAaWw+IX2NaMnuvaS7YvNHPuWLlv64wdazpVm9/wCdUT75cXtmpvQCAZYEAgFAgACoDSA4XS3CnC4e8XPXqL+CFnZ/iexeZbs6Fdu78MI5y5+k6ysWN0zjPKPeDqGkuGuKq3VO1GL+HOXfN/RI6trVtqjfVv8A1+HDv64v3N1Hyx1/P/HXKtSUnrTk5Se1ybbfa2X4piIwpjByqq6qpxqnGXjZkwAOW0Pp2pQ92XvUvhvnH+V/TYczTtWW9J+aN1XPn55uxq7XFzRfkq+ajly8suDuWCx1KtHWpyvvWxrtXMeV0jRrtirs3Iw/U+UvaaNpdnSae1anH9x5w9g0LIAAAAAHjxFeFOOtOSjFc7f9XM7dqu7V2aIxlqu3qLVPbuThH3dT0zwjlUvCjeMOeX8Uuz4V8z02g6optYV3t9XLujOejyOsde1XcbdjdTz75yjq6+dt50A0nndfeWx/1zkYMomeLndG8LcZQsnU5SPw1PeduqW35spXdAs3OEYT9suDo2Na6Ra3TPaj758XbtFcM8NWtGp9jN/E7w7p/rY5d7V123vp3x1/DuaPrexd3VfLP34fnPB2LWTV1mnsZQdWN6MCAAKBAAADoXDXhDOVR4ajNxhDKq4uzlLnjdcy2W33O3q/RKYp+JXG+eDzOtdYVTXNm3O6OP3nl6OnnWcFUQlb37RwOLJKAABujWlCWtCTjJbGnZmFdumuns1RjDZbu126u1ROE/Zz2C4VVI5VYKa3r3Zd/M/kca/qO3VvtT2ftxjP9u/ov+RXaN16ntRzjdOX6czh+EWFntm4vdKL81dHKu6o0qjhGPlOeEu3Z15odzjV2fOMsYe7DSFB7K1P/Mj+pUq0S/Txon8Su06bo1XC5T/tCyx9Fba1P/Mj+pEaLfnhRP4lNWmaPTxuU/7Q9Svp/Cw/5us90U389nzLNvVWlV/xw8939ql3XOh2/wCePlv/AKcRjOFj2UadvxTd3+VfqdOxqKI33asftGf9OPpP+STO6xRh95yjNwGKxdSrLWqTcn1vZ2LYjt2bFuzT2bcYQ87f0m7fq7V2rGXgNzQAALsITwXb2+f7jgcWSUOd4McIJ4WpGMpN4eTtOLzUb/xR3W29ZS0zRKb1MzEfN73Olq/WFej1xTVPy98cvvD6gnfNc+w829kAAKBAAHpaZxyw+HqVeeEfd65PKPzaN2j2vi3Io5/rvV9Kv/Bs1XOUde58glJttt3bzb3tnqojDc8JMzM4yAQlABrb2kcE8WSUAAABUiEo2SgAu3t8yE8UJQAAAF2EJ4ISgA1t7fMhPFklD6fwJ0hy2Eim/fovk32LOL8Mu485rC18O9Mxwnfm9lqq/wDF0eInjTuy6OeKLpAFAgADp/GNjLU6dFP78nOXZHJfOT8Dq6qt411V8t35cLXt3C3TbjvnH8f9dCR23mBkgAAAVsgQkWKvkiMUxGO4tbaI3pmMJRsliAAAFbAgACpkCEgAAAVsJdp4vcZq4mVJvKtDL+aGa+TkczWlvG1FfKf27WpL3ZvTbnvjrH9YvoUnu2nBepVAUCAQDh9McG6WJqKdSpNNRUUouOrZNvni3fMt2NMqs04UxChpWr6NIq7VUzww3YZONXATDdLV8YeksbVu8o9+qpsOx4p6ZHsHhulq+MPSNq3eUe/U2HY8U9Mj2Dw3S1fGHpG1bvKPfqbDseKemS+weF6Wr4w9I2rd5R79TYdjxT0yPYLC9LV8YekbVu8o9+psOx4p6ZL7BYXpa3jD0jat3lHv1NhWPFPTIfALC9LW8YekbVu8o65mw7HinpksOA+GWyrVvzZw9JE6zuz3R1zZRqSxHCqemSy4CYZu7q1bvrh6RGtLsRhhHXNE6ksTOPanpknsDhelreMPSTtW7yjrmjYdjxT0yPYHC9LW/ND0jat3lHXM2HY8U9Mj2BwvS1vzQ9I2rd5R1zNh2PFPTI9gcL0tbxh6RtW7yjrmbDseKemR7A4Xpa3jD0jat3lHXM2HY8U9MiHATDJ5VavVnD5e6ROtLs90dc0xqSxH8p6ZNPgNh9jrVX2uHnqEbSud1Mdc2U6mszxqnpk8a4B4Xpa35oeky2rd5R79WGwrHinpkewWF6Wr4w9I2rd5R79TYdjxT0yPYPC9LV8YekbVu8o9+psOx4p6ZJ7B4bpavjD0jat3lHv1Nh2PFPTI9g8N0tXxh6RtW7yj36mw7HinpkeweG6Wr4w9I2rd5R79TYdjxT0yexgOCNChVjVhVq61N3V3C25p2jstc13dYXLlE0TEb/fNtsaptWbkXKapxjyydgSKDqtgUCAQC339wBAAAACgLgZ1gNRQGrgLgUABLgLgZTAXAAAIAAARsDKz+oG0gAFAgBoAkAAAAAAA0BIoDQC4C4C4C4C4C4EYBAAAAAAAjVwKgAACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//9k='
  });

  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear password error when user types
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Updated profile:', formData);
      setLoading(false);
      // Will implement actual update functionality later
    }, 1500);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    // Basic validation
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Password updated');
      setLoading(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      // Will implement actual password update functionality later
    }, 1500);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, just create a temporary URL for preview
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        avatar: imageUrl
      });
      
      // Will implement actual image upload functionality later
    }
  };

  return (
    <div>
      <div className="mx-auto flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>
            
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bio">
                    Bio
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FaInfoCircle className="text-gray-400" />
                    </div>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          
          {/* Change Password */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength="6"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      passwordError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {passwordError && (
                    <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Profile Picture */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h2>
            
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                Change Picture
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
              
              <p className="text-gray-500 text-sm mt-2 text-center">
                JPG, GIF or PNG. Max size 2MB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;