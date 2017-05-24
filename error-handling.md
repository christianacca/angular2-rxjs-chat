## Errors that can occur, where

### `ChatEntityManager`

**Save to the db**

* Transient network related error
    * Timeout's
    * No connection
    * Latency that does NOT result in a actual timeout but is considered "too long" by app
* Client error (400-499)
* Server error 500
* Authentication

### Scratch notes

**Generic handling**

* Log problem to multiple places
* Show the user a relevant error message (or a sorry something went wrong message)
* Retry transient failures where possible (how to identify transient failures?)
    * fetches - yes
    * saves - only idenpotent operations
        * log operation was retried
        * log the summary of the operation (which entities were saved with # of retries)

**Identifying transient network failures**

* When network is unavailble
    * Use is-online npm module
* When backend server is unavailable
    * Use is-online npm module