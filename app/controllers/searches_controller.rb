class SearchesController < ApplicationController
    def users
      users = Tweet.get_relationships(params[:username])
      render :json => users
    end

    def coordinates
      coordinates = Tweet.get_coordinates(params[:location])
      render :json => {lat:coordinates[0],lng:coordinates[1]}
    end
end
