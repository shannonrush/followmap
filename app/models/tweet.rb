class Tweet 
  require 'net/http'
  require 'twitter'

  def self.get_relationships(username)
      followers = Tweet.get_users(username,"followers")
      friends = Tweet.get_users(username, "friends")
      reciprocal = followers & friends
      followers = followers - reciprocal
      friends = friends - reciprocal
      user = Tweet.get_user(username)
    return {followers:followers,friends:friends,reciprocal:reciprocal,user:user}
  end

  def self.get_coordinates(user_location)
    geo = [nil,nil]
    location = JSON.parse(Net::HTTP.get(URI.parse("http://open.mapquestapi.com/geocoding/v1/address?key=#{MAPQUEST_KEY}&location=#{URI::encode(user_location)}")))
    if location["info"]["statuscode"] == 0 && location["results"][0]["locations"].any?
      coords = location["results"][0]["locations"][0]["latLng"]
      geo = [coords["lat"],coords["lng"]]
    end
    return geo
  end

  private

  def self.get_user(username)
    user = Twitter.user(username)
    coordinates = Tweet.get_coordinates(user.location)
    coordinates = [nil,nil] if coordinates.nil?
    return {username:username,lat:coordinates[0],lng:coordinates[1]}
  end

  def self.get_users(username,relationship)
    all_users = []
    cursor = -1
    while cursor != 0
      batch = Twitter.send(relationship,username,count:5000,cursor:cursor)
      all_users << batch.users
      cursor = batch.next_cursor
    end
    all_users.flatten!
    users = []
    all_users.each{|user| users << {username:username,location:user.location} if user.location.present?}
    return users
  end


end
