from random import normalvariate

##########################################################################
# "Real world" that we're trying to track
class RealWorld:
    def __init__(self):
        self.position = 0.0
        self.velocity = 0.5
        self.time_step = 0.1
        self.time = 0.0
        self.measure = None

        # Noise on the measurements
        self.measurement_variance = 3.0

        # If we want to kink the profile.
        self.change_after = 50
        self.changed_velocity = -0.5

    def measurement(self):
        if self.measure == None:
            self.measure = (self.position
                            + normalvariate(0, self.measurement_variance))
        return self.measure

    def step(self):
        self.time += self.time_step
        self.position += self.velocity * self.time_step

        if self.time >= self.change_after:
            self.velocity = self.changed_velocity
        self.measure = None

world = RealWorld()   

##########################################################################
# Model
# Estimates
estimate_position = 0.0
estimate_velocity = 0.0

# Covariance matrix
P_xx = 0.1 # Variance of the position
P_xv = 0.1 # Covariance of position and velocity
P_vv = 0.1 # Variance of the velocity

##########################################################################
# Model parameters
position_process_variance = 0.01
velocity_process_variance = 0.01
R = 30.0 # Measurement noise variance

average_length = 30
data = []

print 'Time\tActual\tMeasurement\tPosition Estimate\tVelocity Estimate'
for i in range(1000):
    world.step()
    measurement = world.measurement()

    # We need to boot strap the estimates for temperature and
    # rate
    if i == 0: # First measurement
        estimate_position = measurement       
    elif i == 1: # Second measurement
        estimate_velocity = ( measurement - estimate_position ) / world.time_step
        estimate_position = measurement
    else: # Can apply model
        ##################################################################
        # Temporal update (predictive)
        estimate_position += estimate_velocity * world.time_step

        # Update covariance
        P_xx += world.time_step * ( 2.0 * P_xv + world.time_step * P_vv )
        P_xv += world.time_step * P_vv
       
        P_xx += world.time_step * position_process_variance
        P_vv += world.time_step * velocity_process_variance
       
        ##################################################################       
        # Observational update (reactive)
        vi = 1.0 / ( P_xx + R )
        kx = P_xx * vi
        kv = P_xv * vi

        estimate_position += (measurement - estimate_position) * kx
        estimate_velocity += (measurement - estimate_position) * kv

        P_xx *= ( 1 - kx )
        P_xv *= ( 1 - kx )
        P_vv -= kv * P_xv

    print '\t'.join(str(x) for x in [world.time, world.position, measurement, \
                                     estimate_position, estimate_velocity])
