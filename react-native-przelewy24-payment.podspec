require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-przelewy24-payment"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-przelewy24-payment
                   DESC
  s.homepage     = "https://github.com/tyson90/react-native-przelewy24-payment"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "Konstantin Koulechov" => "kostek.sni@gmail.pl" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/tyson90/react-native-przelewy24-payment.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  # ...
  # s.dependency "..."
end
