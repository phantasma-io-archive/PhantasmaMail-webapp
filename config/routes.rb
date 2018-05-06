Rails.application.routes.draw do
  root to: 'application#landing'

  get 'app' => 'application#app'
end
