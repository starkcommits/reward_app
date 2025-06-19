import React from 'react'

const TopInviters = () => {
  const inviters = [
    {
      id: 1,
      name: 'Harshit Adhikari',
      username: '@mitsuxhoney',
      earnings: 601234,
      position: 1,
      avatar:
        'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      id: 2,
      name: 'Anurag',
      username: '@maverick',
      earnings: 159255,
      position: 2,
      avatar:
        'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      id: 3,
      name: 'Rahul',
      username: '@papne',
      earnings: 151159,
      position: 3,
      avatar:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
  ]

  // Function to format earnings with commas
  const formatEarnings = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100 ">
      <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">
        TOP INVITERS
      </h2>

      <div className="flex justify-between items-end mb-4 px-4 ">
        {inviters.map((inviter) => {
          const isFirst = inviter.position === 1
          const size = isFirst ? 'large' : 'medium'

          return (
            <div
              key={inviter.id}
              className={`flex flex-col items-center ${
                isFirst
                  ? 'order-2'
                  : inviter.position === 2
                  ? 'order-1'
                  : 'order-3'
              }`}
            >
              <div className="relative">
                <div
                  className={`
                  rounded-full border-4 border-amber-400 overflow-hidden
                  ${size === 'large' ? 'h-24 w-24' : 'h-16 w-16'}
                  ${isFirst ? 'shadow-lg' : 'shadow-md'}
                  transition-all duration-300 hover:scale-105
                `}
                >
                  <img
                    src={inviter.avatar}
                    alt={inviter.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div
                  className={`
                  absolute -bottom-3 left-1/2 transform -translate-x-1/2
                  bg-amber-400 text-amber-900 font-bold rounded-full flex items-center justify-center
                  ${size === 'large' ? 'h-8 w-8 text-lg' : 'h-6 w-6 text-sm'}
                `}
                >
                  {inviter.position}
                </div>
              </div>

              {isFirst && (
                <div className="mt-6 text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    ₹{formatEarnings(inviter.earnings)}
                  </p>
                  <p className="text-xs text-gray-500">{inviter.username}</p>
                </div>
              )}

              {!isFirst && (
                <div className="mt-4 text-center">
                  <p className="text-sm font-semibold text-gray-800">
                    ₹{formatEarnings(inviter.earnings)}
                  </p>
                  <p className="text-xs text-gray-500">{inviter.username}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TopInviters
