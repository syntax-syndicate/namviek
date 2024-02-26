package libs

import (
	"errors"
	"log"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

var ACCESS_KEY = os.Getenv("JWT_SECRET_KEY")
var REFRESH_KEY = os.Getenv("JWT_REFRESH_KEY")
var SECRET_EXPIRED = os.Getenv("JWT_TOKEN_EXPIRED")
var REFRESH_EXPIRED = os.Getenv("JWT_REFRESH_EXPIRED")

type UserClaim struct {
	jwt.MapClaims
	id    string
	email string
	name  string
	photo string
}

func GenAccessToken(id string, email string, name string, photo string) (string, error) {

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":    id,
		"name":  name,
		"email": email,
		"photo": photo,
	})

	return _createJwtSignedString("ACCESS_KEY", token)

}

func GenRefreshToken(email string) (string, error) {

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
	})

	return _createJwtSignedString("REFRESH_KEY", token)

}

func _createJwtSignedString(t string, token *jwt.Token) (string, error) {
	var key []byte

	switch t {
	case "ACCESS_KEY":
		log.Println("access_key", ACCESS_KEY)
		key = []byte(ACCESS_KEY)
	case "REFRESH_KEY":
		log.Println("access_key", REFRESH_KEY)
		key = []byte(REFRESH_KEY)
	}

	tokenString, err := token.SignedString(key)

	if err != nil {
		return "", err
	}

	return tokenString, nil

}

func ParseToken(tokenType string, token string) (jwt.MapClaims, error) {

	if token == "" {
		return nil, errors.New("Token is empty")
	}

	// parse token to get jwt token
	jwtToken, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if tokenType == "ACCESS_KEY" {
			log.Println("access key", ACCESS_KEY)
			return []byte(ACCESS_KEY), nil
		}

		log.Println("access key", REFRESH_KEY)
		return []byte(REFRESH_KEY), nil
	})

	// if jwtToken is expired or invalid
	if err != nil {
		log.Println("Parsing jwt error, check whether secret key is correct or not")
		return nil, err
	}

	var claims = jwtToken.Claims.(jwt.MapClaims)

	log.Println("================================================")
	log.Println(claims["email"], claims["photo"], claims["id"])

	return claims, nil

}
