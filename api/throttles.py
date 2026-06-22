from rest_framework.throttling import AnonRateThrottle

class PublicStatsThrottle(AnonRateThrottle):
    """
    Dedicated rate limit for public stats to prevent it from exhausting 
    the global anonymous throttle bucket.
    """
    scope = 'public_stats'
