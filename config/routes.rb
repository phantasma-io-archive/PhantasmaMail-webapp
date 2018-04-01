Rails.application.routes.draw do
  root to: "landing#index"

  get 'inbox' => 'main#inbox'
  get 'wallet' => 'main#wallet'
  get 'files' => 'main#files'
  get 'subs' => 'main#subs'
  get 'disclaimer' => 'main#disclaimer'
  get 'no_local_storage' => 'main#no_local_storage'
end
